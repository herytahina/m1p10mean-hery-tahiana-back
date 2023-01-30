const nodemailer = require('nodemailer');

const email = 'no.reply.meuh@gmail.com';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: 'skmvggpoljuqmpbi'
    }
});

const writeHtml = (car, user) => {
    return `
    <div>
        <p>Bonjour ${user},</p>
        <br/>
        <p>Guru Able tiens à vous informer que les réparations de votre voiture <b>${car.brand} ${car.model}</b> immatriculée <b>${car.immatriculation}</b> ont été terminés.</p>
        <p>Nous vous invitons alors à la récuperer au garage dans lequel vous l'avez déposé.</p>
        <p>Nous vous remercions de votre fidèlité. A bientot!</p>
        <br/>
        <p>L'équipe Guru Able</p>
    </div>
    `
}

const sendMail = (to, car, user) => {
    const mailOptions = {
        from: email,
        to,
        subject: `Récupération de la voiture ${car.immatriculation}`,
        html: writeHtml(car, user)
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return false;
        } else {
          console.log('Email sent: ' + info.response);
          return true;
        }
      });
}

module.exports = {
    sendMail
}