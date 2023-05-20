const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const doctors = {
  "Dr. M Majumdar": "MMJ",
  "Dr. Sri Krishna Rao": "SKR",
  "Dr. B R Ambedkar": "ABD",
  "Dr. Abhijit Mitra": "ABM",
  "Dr. Avinash Jadavbhai Patel": "AJP",
  "Dr. Bhuvaneswari Kandalkar": "BKD",
  "Dr. GopalKrishna B.A": "GPK",
  "Dr. Nalini G Shenoy": "NGS",
  "Dr. Uday Kumar Maiya M": "UKM",
  "Dr. S.K. Jayaprakash": "SKJ",
  "Dr. Srigiri S Revadi": "SSR",
  "Dr. Varun Kumar J": "VKJ"
};

let appointmentCounter = {};

// Function to generate the appointment number
function generateAppointmentNumber(doctor) {
  const doctorCode = doctors[doctor];
  const serialNumberString = String(appointmentCounter[doctor]).padStart(3, '0');
  const appointmentNumber = `${doctorCode}-${serialNumberString}`;

  // Increment the serial number for the next user
  appointmentCounter[doctor]++;

  return appointmentNumber;
}

// Function to generate the time slot
function generateTimeSlot(doctor) {
  const startTime = new Date();
  startTime.setHours(10, 0, 0); // Start time: 10:00 AM

  // Check if it's lunch break (1:00 PM to 2:00 PM)
  const currentHour = startTime.getHours();
  if (currentHour >= 13 && currentHour < 14) {
    startTime.setHours(14, 0, 0); // Skip lunch break, set to 2:00 PM
  } else if (currentHour >= 12 && currentHour < 13) {
    startTime.setHours(13, 0, 0); // Skip time slots between 1:00 PM and 1:59 PM
  }

  let timeSlot = new Date(startTime);
  if (appointmentCounter[doctor] > 1) {
    const previousSlots = appointmentCounter[doctor] - 1;
    timeSlot.setMinutes(timeSlot.getMinutes() + (previousSlots * 20));
  }

  const formattedTimeSlot = timeSlot.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });

  return formattedTimeSlot;
}

// Handle the webhook request
app.post('/webhook', (req, res) => {
  const intent = req.body.queryResult.intent.displayName;

  let doctor, userName, getTime;
  if (intent === 'Urology') {
    doctor = req.body.queryResult.parameters['Urology_doctors'];
    userName = req.body.queryResult.parameters['last-name'];
    getTime = req.body.queryResult.parameters['date'];
  } else if (intent === 'Pathology') {
    doctor = req.body.queryResult.parameters['Pathology_doctors'];
    userName = req.body.queryResult.parameters['last-name'];
    getTime = req.body.queryResult.parameters['date'];
  } else if (intent === 'Internal Medicine') {
    doctor = req.body.queryResult.parameters['Internal_Medicine_doctors'];
    userName = req.body.queryResult.parameters['last-name'];
    getTime = req.body.queryResult.parameters['date'];
  } else if (intent === 'Dentistry') {
    doctor = req.body.queryResult.parameters['Dentistry_doctors'];
    userName = req.body.queryResult.parameters['last-name'];
    getTime = req.body.queryResult.parameters['date'];
  }

  if (!appointmentCounter.hasOwnProperty(doctor)) {
    appointmentCounter[doctor] = 1;
  }

  const appointmentNumber = generateAppointmentNumber(doctor);
  const timeSlot = generateTimeSlot(doctor);

  const response = {
    fulfillmentMessages: [
      {
        text: {
          text: [
            `Hello ${userName}, your appointment with ${doctor} is confirmed. See you there on ${getTime}.`
          ]
        }
      },
      {
        text: {
          text: [
            `Your appointment ID is ${appointmentNumber}.`
          ]
        }
      },
      {
        text: {
          text: [
            `Time Slot: ${timeSlot}`
          ]
        }
      },
      {
        text: {
          text: [
            `See you there on ${getTime}`
          ]
        }
      },
      {
        text: {
          text: [
            `Ask about: Triangle`
          ]
        }
      },
      {
        text: {
          text: [
            `For a new appointment "Type : New appointment"`
          ]
        }
      },

    ]
  };

  res.json(response);
});

// Start the server
app.listen(3000, () => {
  console.log('Webhook server is listening on port 3000');
});
