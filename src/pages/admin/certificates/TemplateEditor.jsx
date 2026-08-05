import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { ChevronLeft, Save, Plus, Trash2, Sliders, Type, LayoutTemplate, Upload, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const PLACEHOLDERS = [
  { key: 'studentName', label: 'Student Name', defaultVal: 'Anash Khan' },
  { key: 'fatherName', label: "Father's Name", defaultVal: 'Julfikar Ahmad' },
  { key: 'class', label: 'Class / Standard', defaultVal: '12' },
  { key: 'board', label: 'Board Name', defaultVal: 'MPBSE' },
  { key: 'percentage', label: 'Percentage Score', defaultVal: '94.5' },
  { key: 'certificateNo', label: 'Certificate No', defaultVal: 'IQRA/2026/001' },
  { key: 'awardName', label: 'Award Name', defaultVal: '' },
  { key: 'awardYear', label: 'Award Year', defaultVal: '' },
  { key: 'issueDate', label: 'Issue Date', defaultVal: '05/01/2026' }
];

const FONTS = ['serif', 'sans-serif', 'monospace', 'cursive', 'Georgia', 'Arial', 'Times New Roman', 'Cinzel', 'Great Vibes', 'Alex Brush', 'Pinyon Script', 'Fineday'];

const TemplateEditor = () => {
  const { token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Design Workspace variables
  const [templateName, setTemplateName] = useState('');
  const [language, setLanguage] = useState('English');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [width, setWidth] = useState(842);
  const [height, setHeight] = useState(595);
  const [textCoordinates, setTextCoordinates] = useState({});
  const [qrSettings, setQrSettings] = useState({ enabled: true, x: 720, y: 470, size: 80, margin: 2 });
  
  // Editor UI State
  const [selectedField, setSelectedField] = useState('studentName');
  const [isEditing, setIsEditing] = useState(false); // true if editing existing template, false if new
  const [draggedField, setDraggedField] = useState(null);
  
  const containerRef = useRef(null);

  // Fetch initial templates on load
  const loadTemplates = async () => {
    try {
      const list = await api.fetchTemplates(token);
      setTemplates(list);
      if (list.length > 0) {
        loadTemplateIntoEditor(list[0]);
      } else {
        resetWorkspace();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load design templates.');
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [token]);

  const loadTemplateIntoEditor = (tpl) => {
    setSelectedTemplateId(tpl._id);
    setTemplateName(tpl.templateName);
    setLanguage(tpl.language);
    setBackgroundImage(tpl.backgroundImage);
    setWidth(tpl.width || 842);
    setHeight(tpl.height || 595);
    
    // Map textCoordinates converting Mongoose Map if needed
    const coords = {};
    PLACEHOLDERS.forEach(p => {
      const config = tpl.textCoordinates?.[p.key] || tpl.textCoordinates?.get?.(p.key) || {
        x: width / 2,
        y: height / 2 + 30,
        fontSize: 22,
        fontWeight: 'normal',
        fontFamily: 'serif',
        color: '#000000',
        align: 'center',
        italic: false,
        rotation: 0
      };
      coords[p.key] = config;
    });
    setTextCoordinates(coords);
    setQrSettings(tpl.qrSettings || { enabled: true, x: 720, y: 470, size: 80, margin: 2 });
    setIsEditing(true);
  };

  const resetWorkspace = () => {
    setSelectedTemplateId('');
    setTemplateName('New Certificate Design');
    setLanguage('English');
    setBackgroundImage('');
    setWidth(842);
    setHeight(595);
    
    const defaults = {};
    PLACEHOLDERS.forEach((p, idx) => {
      defaults[p.key] = {
        x: 421,
        y: 100 + (idx * 45),
        fontSize: 20,
        fontWeight: 'normal',
        fontFamily: 'serif',
        color: '#000000',
        align: 'center',
        italic: false,
        rotation: 0
      };
    });
    setTextCoordinates(defaults);
    setQrSettings({ enabled: true, x: 720, y: 470, size: 80, margin: 2 });
    setIsEditing(false);
  };

  const handleTemplateSelection = (e) => {
    const id = e.target.value;
    if (id === 'new') {
      resetWorkspace();
    } else {
      const tpl = templates.find(t => t._id === id);
      if (tpl) loadTemplateIntoEditor(tpl);
    }
  };

  // Background Image upload handler (converts to base64 for self-containment)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please upload a compressed background image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setBackgroundImage(uploadEvent.target.result);
      toast.success('Background template loaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleFieldStyleChange = (key, val) => {
    if (selectedField === 'qrCode') {
      setQrSettings(prev => ({
        ...prev,
        [key]: val
      }));
      return;
    }

    setTextCoordinates(prev => ({
      ...prev,
      [selectedField]: {
        ...prev[selectedField],
        [key]: val
      }
    }));
  };

  // Drag and Drop calculations on visual layout container
  const handleContainerMouseMove = (e) => {
    if (!draggedField || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    // Relative offset coordinates inside parent container
    const mouseX = Math.round((e.clientX - rect.left) * scaleX);
    const mouseY = Math.round((e.clientY - rect.top) * scaleY);

    // Bound values inside template limits
    const clampedX = Math.max(0, Math.min(width, mouseX));
    const clampedY = Math.max(0, Math.min(height, mouseY));

    if (draggedField === 'qrCode') {
      setQrSettings(prev => ({
        ...prev,
        x: clampedX - prev.size / 2,
        y: clampedY - prev.size / 2
      }));
    } else {
      setTextCoordinates(prev => ({
        ...prev,
        [draggedField]: {
          ...prev[draggedField],
          x: clampedX,
          y: clampedY
        }
      }));
    }
  };

  const handleDragStart = (fieldName) => {
    setDraggedField(fieldName);
    setSelectedField(fieldName);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  // Save template configuration to database
  const handleSaveTemplate = async () => {
    if (!templateName) {
      toast.error('Please enter a Template Name.');
      return;
    }
    if (!backgroundImage) {
      toast.error('Please upload a Background Image.');
      return;
    }

    const saveToast = toast.loading('Saving design template settings...');
    const payload = {
      templateName,
      language,
      backgroundImage,
      width,
      height,
      textCoordinates,
      qrSettings
    };

    try {
      if (isEditing && selectedTemplateId) {
        await api.updateTemplate(selectedTemplateId, payload, token);
        toast.success('Template updated successfully!', { id: saveToast });
      } else {
        const newTpl = await api.createTemplate(payload, token);
        toast.success('New template created successfully!', { id: saveToast });
        setSelectedTemplateId(newTpl._id);
        setIsEditing(true);
      }
      loadTemplates();
    } catch (err) {
      toast.error(err.message || 'Failed to save template configuration.', { id: saveToast });
    }
  };

  // Delete Template from system database
  const handleDeleteTemplate = async () => {
    if (!selectedTemplateId) return;

    const confirm = await Swal.fire({
      title: 'Delete Design Template?',
      text: 'This will permanently remove this certificate layout from the system.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });

    if (confirm.isConfirmed) {
      const deleteToast = toast.loading('Deleting layout configuration...');
      try {
        await api.deleteTemplate(selectedTemplateId, token);
        toast.success('Template deleted successfully.', { id: deleteToast });
        resetWorkspace();
        loadTemplates();
      } catch (err) {
        toast.error(err.message || 'Failed to delete template.', { id: deleteToast });
      }
    }
  };

  const currentFieldConfig = selectedField === 'qrCode' ? qrSettings : textCoordinates[selectedField] || {};

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/certificates" 
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-extrabold text-2xl text-emerald-955">Visual Template Designer</h1>
            <p className="text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-wider">Configure visual overlays dynamically</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleDeleteTemplate}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-655 text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Layout
            </button>
          )}
          <button
            onClick={handleSaveTemplate}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="flex-grow min-w-[200px]">
          <select
            value={selectedTemplateId || 'new'}
            onChange={handleTemplateSelection}
            className="w-full py-2 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50 rounded-xl font-bold text-slate-700 text-xs"
          >
            {templates.map(t => (
              <option key={t._id} value={t._id}>Edit: {t.templateName} ({t.language})</option>
            ))}
            <option value="new">+ Create New Layout Design</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap text-xs font-semibold">
          <input
            type="text"
            placeholder="Template Name (e.g. Merit Toppers A4)"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-xl focus:border-emerald-700/60 outline-hidden"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-xl text-slate-700 bg-white"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Urdu">Urdu</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual dragging configuration workspace */}
        <div 
          className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-4"
          onMouseMove={handleContainerMouseMove}
          onMouseUp={handleDragEnd}
        >
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-serif font-bold text-base text-emerald-955 flex items-center gap-1">
              <Eye className="w-5 h-5" />
              Workspace Drag Screen
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drag labels directly on the certificate background</p>
          </div>

          {/* Canvas draggable container */}
          {backgroundImage ? (
            <div 
              ref={containerRef}
              style={{ aspectRatio: `${width}/${height}`, maxWidth: '100%' }}
              className="relative border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50 select-none cursor-default"
            >
              {/* background image */}
              <img 
                src={backgroundImage} 
                alt="Certificate Template" 
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* Absolute Overlays for Placeholder Text Fields */}
              {PLACEHOLDERS.map(p => {
                const config = textCoordinates[p.key];
                if (!config || config.enabled === false) return null;

                const isSelected = selectedField === p.key;

                return (
                  <div
                    key={p.key}
                    onMouseDown={() => handleDragStart(p.key)}
                    style={{
                      position: 'absolute',
                      left: `${(config.x / width) * 100}%`,
                      top: `${(config.y / height) * 100}%`,
                      transform: `translate(${config.align === 'center' ? '-50%' : config.align === 'right' ? '-100%' : '0%'}, -50%) rotate(${config.rotation || 0}deg)`,
                      fontFamily: config.fontFamily,
                      fontSize: `clamp(8px, ${(config.fontSize / width) * 100}vw, ${config.fontSize}px)`,
                      fontWeight: config.fontWeight,
                      color: config.color,
                      fontStyle: config.italic ? 'italic' : 'normal',
                      letterSpacing: `${config.letterSpacing}px`,
                      whiteSpace: 'nowrap'
                    }}
                    className={`px-1.5 py-0.5 rounded cursor-move transition-shadow hover:bg-emerald-50/70 border ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20 z-30' 
                        : 'border-dashed border-slate-300 hover:border-emerald-500 z-20'
                    }`}
                  >
                    {p.defaultVal}
                  </div>
                );
              })}

              {/* QR Code visual bounding mock box */}
              {qrSettings.enabled && (
                <div
                  onMouseDown={() => handleDragStart('qrCode')}
                  style={{
                    position: 'absolute',
                    left: `${(qrSettings.x / width) * 100}%`,
                    top: `${(qrSettings.y / height) * 100}%`,
                    width: `${(qrSettings.size / width) * 100}%`,
                    height: `${(qrSettings.size / height) * 100}%`,
                  }}
                  className={`bg-slate-200 border-2 rounded-lg flex items-center justify-center text-[8px] font-bold text-slate-500 cursor-move ${
                    selectedField === 'qrCode' 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md z-30' 
                      : 'border-dashed border-slate-350 hover:border-emerald-500 z-20'
                  }`}
                >
                  [QR Code]
                </div>
              )}

            </div>
          ) : (
            /* Upload file state wrapper */
            <div className="border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center flex flex-col items-center justify-center p-6 space-y-4">
              <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-emerald-955">No Background Template Uploaded</h4>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm">Please upload a clean high-resolution landscape certificate template (PNG or JPG) to start customizing.</p>
              </div>
              <label className="cursor-pointer py-2.5 px-4 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                Select Background File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Column: Customization Sidebar controls */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-5">
          <div className="flex gap-1.5 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-slate-400 mt-0.5" />
            <h3 className="font-serif font-bold text-base text-emerald-955">Label Properties</h3>
          </div>

          {/* Active Field selector dropdown */}
          <div className="text-xs font-semibold text-slate-500 space-y-1">
            <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Active Element</label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full py-2 px-3 border border-slate-200 bg-slate-50 rounded-xl font-bold text-slate-700"
            >
              {PLACEHOLDERS.map(p => (
                <option key={p.key} value={p.key}>
                  {p.label}{textCoordinates[p.key]?.enabled === false ? ' (Disabled)' : ''}
                </option>
              ))}
              <option value="qrCode">[QR Code Box]</option>
            </select>
          </div>

          {/* Controls logic mapping */}
          {selectedField === 'qrCode' ? (
            /* QR Settings control sliders */
            <div className="space-y-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="qrEnabled"
                  checked={qrSettings.enabled}
                  onChange={(e) => handleFieldStyleChange('enabled', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-950 focus:ring-emerald-900"
                />
                <label htmlFor="qrEnabled" className="text-xs text-slate-750 font-bold">Enable Security QR Code</label>
              </div>

              {qrSettings.enabled && (
                <>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">QR Code Size (px)</label>
                      <span className="font-mono text-emerald-900">{qrSettings.size}px</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="200"
                      value={qrSettings.size}
                      onChange={(e) => handleFieldStyleChange('size', Number(e.target.value))}
                      className="w-full accent-emerald-950"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Position X</label>
                      <input
                        type="number"
                        value={qrSettings.x}
                        onChange={(e) => handleFieldStyleChange('x', Number(e.target.value))}
                        className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:border-emerald-700/60 outline-hidden bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Position Y</label>
                      <input
                        type="number"
                        value={qrSettings.y}
                        onChange={(e) => handleFieldStyleChange('y', Number(e.target.value))}
                        className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:border-emerald-700/60 outline-hidden bg-slate-50"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Font Overlay coordinates and style sliders */
            <div className="space-y-4 text-xs font-semibold text-slate-500">
              
              {/* Enable/Disable Field Checkbox Toggle */}
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl mb-2">
                <div>
                  <h4 className="font-serif font-bold text-xs text-emerald-955">Enable on Certificate</h4>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Toggle display visibility & form entry</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentFieldConfig.enabled !== false}
                  onChange={(e) => handleFieldStyleChange('enabled', e.target.checked)}
                  className="h-4.5 w-4.5 rounded-sm border-slate-350 text-emerald-955 focus:ring-emerald-900 cursor-pointer"
                />
              </div>

              {/* Font Family selection */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Font Family</label>
                <select
                  value={currentFieldConfig.fontFamily || 'serif'}
                  onChange={(e) => handleFieldStyleChange('fontFamily', e.target.value)}
                  className="w-full py-2 px-3 border border-slate-200 bg-slate-50 rounded-xl font-bold text-slate-700"
                >
                  {FONTS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Grid: Coordinates X and Y */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Position X</label>
                  <input
                    type="number"
                    value={currentFieldConfig.x || 0}
                    onChange={(e) => handleFieldStyleChange('x', Number(e.target.value))}
                    className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:border-emerald-700/60 outline-hidden bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Position Y</label>
                  <input
                    type="number"
                    value={currentFieldConfig.y || 0}
                    onChange={(e) => handleFieldStyleChange('y', Number(e.target.value))}
                    className="w-full py-2 px-3 border border-slate-200 rounded-xl focus:border-emerald-700/60 outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              {/* Slider: Font Size */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Font Size (px)</label>
                  <span className="font-mono text-emerald-900">{currentFieldConfig.fontSize || 20}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="120"
                  value={currentFieldConfig.fontSize || 20}
                  onChange={(e) => handleFieldStyleChange('fontSize', Number(e.target.value))}
                  className="w-full accent-emerald-950"
                />
              </div>

              {/* Selection: Color Picker */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={currentFieldConfig.color || '#000000'}
                    onChange={(e) => handleFieldStyleChange('color', e.target.value)}
                    className="h-10 w-12 border border-slate-200 rounded-lg cursor-pointer bg-slate-50"
                  />
                  <input
                    type="text"
                    value={currentFieldConfig.color || '#000000'}
                    onChange={(e) => handleFieldStyleChange('color', e.target.value)}
                    className="flex-grow py-2 px-3 border border-slate-200 rounded-xl focus:border-emerald-700/60 outline-hidden bg-slate-50"
                  />
                </div>
              </div>

              {/* Grid: Font alignment options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Text Alignment</label>
                  <select
                    value={currentFieldConfig.align || 'center'}
                    onChange={(e) => handleFieldStyleChange('align', e.target.value)}
                    className="w-full py-2 px-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-700"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Font Weight</label>
                  <select
                    value={currentFieldConfig.fontWeight || 'normal'}
                    onChange={(e) => handleFieldStyleChange('fontWeight', e.target.value)}
                    className="w-full py-2 px-3 border border-slate-200 bg-slate-50 rounded-xl text-slate-700"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
              </div>

              {/* Flex: Rotation Slider and Italic Check */}
              <div className="flex items-center gap-4 py-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="italicToggle"
                    checked={currentFieldConfig.italic || false}
                    onChange={(e) => handleFieldStyleChange('italic', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-955 focus:ring-emerald-900"
                  />
                  <label htmlFor="italicToggle" className="text-xs font-bold text-slate-750">Italic Text</label>
                </div>
              </div>

              {/* Slider: Rotation angle */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Rotation Angle (deg)</label>
                  <span className="font-mono text-emerald-900">{currentFieldConfig.rotation || 0}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={currentFieldConfig.rotation || 0}
                  onChange={(e) => handleFieldStyleChange('rotation', Number(e.target.value))}
                  className="w-full accent-emerald-955"
                />
              </div>

            </div>
          )}

          {/* Background image replacement options */}
          {backgroundImage && (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <label className="cursor-pointer w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Change Background File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default TemplateEditor;
export { TemplateEditor };
