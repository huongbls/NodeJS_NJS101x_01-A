const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const absenceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  registerLeave: [
    {
      fromDate: {
        type: Date,
        required: true,
        unique: true,
      },
      toDate: {
        type: Date,
        required: true,
        unique: true,
      },
      hours: {
        type: Number,
        required: true,
      },
      fromHour: {
        type: String,
        required: true,
      },
      toHour: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
    },
  ],
});

// absenceSchema.statics.addAbsence = function (
//   userId,
//   type,
//   date,
//   hours,
//   dates,
//   reason
// ) {
//   if (type == 1) {
//     const dateArr = dates.split(",");
//     const newAbsence = [];
//     dateArr.forEach((date) => {
//       newAbsence.push({
//         userId: userId,
//         date: new Date(date),
//         days: 1,
//         reason: reason,
//       });
//     });
//     return this.insertMany(newAbsence);
//   } else if (type == 0) {
//     const newAbsence = {
//       userId: userId,
//       date: new Date(date),
//       days: hours / 8,
//       reason: reason,
//     };
//     return this.create(newAbsence);
//   }
// };

module.exports = mongoose.model("Absence", absenceSchema);
