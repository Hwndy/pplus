// import React from 'react';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";

// const DateRangePicker = ({ startDate, endDate, onChange }) => {
//     return (
//         <div className="d-flex align-items-center">
//             <div className="input-group mr-3">
//                 <div className="input-group-prepend">
//                     <span className="input-group-text">From</span>
//                 </div>
//                 <DatePicker
//                     selected={startDate}
//                     onChange={date => onChange({ startDate: date, endDate })}
//                     className="form-control"
//                     dateFormat="yyyy-MM-dd"
//                     maxDate={endDate}
//                 />
//             </div>
//             <div className="input-group">
//                 <div className="input-group-prepend">
//                     <span className="input-group-text">To</span>
//                 </div>
//                 <DatePicker
//                     selected={endDate}
//                     onChange={date => onChange({ startDate, endDate: date })}
//                     className="form-control"
//                     dateFormat="yyyy-MM-dd"
//                     minDate={startDate}
//                     maxDate={new Date()}
//                 />
//             </div>
//         </div>
//     );
// };

// export default DateRangePicker;