import React from 'react';
import { Award, School, User, Phone, Tag } from 'lucide-react';

const StudentCard = ({ student }) => {
  const {
    name,
    fathersName,
    schoolName,
    board,
    score,
    year,
    examType,
    studentPhone,
    parentsPhone,
    rollNumber,
    profilePic
  } = student;

  const isIslamic = examType === 'islamic';

  return (
    <div className="bg-white rounded-2xl border border-slate-150/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
      {/* Badge Top Info */}
      <div className={`text-xs font-bold px-4 py-3 flex justify-between items-center border-b border-slate-100 ${
        isIslamic ? 'bg-emerald-50/50 text-emerald-800' : 'bg-amber-50/50 text-amber-800'
      }`}>
        <span className="uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5" />
          {board}
        </span>
        <span className="bg-white px-2.5 py-0.5 rounded-full border border-slate-200 text-slate-500 font-semibold">{year}</span>
      </div>

      {/* Main Body */}
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        {/* Profile Picture */}
        {profilePic ? (
          <img 
            src={profilePic} 
            alt={name} 
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md mb-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-950 flex items-center justify-center text-2xl font-extrabold border-4 border-slate-50 shadow-md mb-4 font-serif">
            {name.charAt(0)}
          </div>
        )}

        {/* Student Name */}
        <h3 className="font-sans font-bold text-emerald-950 text-base mb-1">{name}</h3>

        {/* Father's Name */}
        {fathersName && (
          <p className="text-xs text-slate-400 mb-2 flex items-center justify-center gap-1">
            <User className="w-3 h-3 text-slate-350" />
            S/O: <span className="font-semibold text-slate-650">{fathersName}</span>
          </p>
        )}

        {/* School Name */}
        <p className="text-xs text-slate-450 italic flex items-center justify-center gap-1 max-w-[200px] truncate mb-4">
          <School className="w-3.5 h-3.5 text-slate-350 flex-shrink-0" />
          {schoolName}
        </p>

        {/* Highlighted Score Badge */}
        <div className="mt-auto bg-slate-50 text-emerald-900 border border-slate-200/80 font-extrabold text-sm px-6 py-2 rounded-full shadow-sm flex items-center gap-1.5">
          <span className="text-amber-500">🏆</span>
          Score: {score}
        </div>
      </div>

      {/* Contact & Roll Number Panel (Visible only if backend returns them unmasked) */}
      {(studentPhone || parentsPhone || rollNumber) && (
        <div className="bg-slate-50/70 border-t border-slate-100 p-4 text-[11px] text-slate-600 text-left space-y-1.5 font-medium">
          {rollNumber && (
            <p className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3" /> Roll No:</span>
              <span className="font-bold text-slate-800">{rollNumber}</span>
            </p>
          )}
          {studentPhone && (
            <p className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> Student:</span>
              <span className="font-bold text-slate-800">{studentPhone}</span>
            </p>
          )}
          {parentsPhone && (
            <p className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> Parent:</span>
              <span className="font-bold text-slate-800">{parentsPhone}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCard;
export { StudentCard };
