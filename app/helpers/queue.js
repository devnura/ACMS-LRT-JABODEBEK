var queueRecon = [];
var queueReservation = [];

const reconReceive = (reservationNumber) => {
  queueRecon.push(reservationNumber);

  // console.log(`QUEUE RECON : ${queueRecon}`);

  return queueRecon;
};

const reconFinish = (queueRecon) => {
  queueRecon.shift();

  // console.log(`SHIFT QUEUE RECON : ${queueRecon}`);

  return queueRecon;
};

const reservationReceive = (reservationNumber) => {
  queueReservation.push(reservationNumber);

  return queueReservation;
};

const reservationFinish = (queueReservation) => {
  queueReservation.shift();

  return queueReservation;
};

module.exports = {
  reconReceive,
  reconFinish,
  reservationReceive,
  reservationFinish,
};
