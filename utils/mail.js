// main.js
const nodemailer = require('nodemailer');

// configure option
const option = {
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(option);

// send email
const sendEmail = async ({ to, subject, text, html, ...rest }) => {
  try {
    const res = await transporter.verify();
    if (res) {
      //config mail
      const mail = {
        //sender access
        from: '"Hama Instagram" <no-reply@hippo-instagram.herokuapp.com>',
        //receiver access
        to,
        //subject
        subject,
        //content text
        text,
        //html
        html,
        //others
        ...rest,
      };
      //Tiến hành gửi email
      const info = await transporter.sendMail(mail);
      if (info) {
        return true;
      }
    }
  } catch (err) {
    console.error('ERROR MAILER: ', err);
    return false;
  }
};

const headerHtmlMail = `<h1 style="color: #018c4c; font-size: 48px; border-bottom: solid 2px #ccc;padding-bottom: 10px">
      Hama - Instagram<br />
    </h1>`;
const footerHtmlVerifyMail = `<h3 style="color: red">
        Chú ý: Không đưa mã này cho bất kỳ ai,
        có thể dẫn đến mất tài khoản.<br />
        Mã chỉ có hiệu lực <i>10 phút </i> từ khi bạn nhận được mail.
    </h3>
    <h1>Cảm ơn.</h1>`;

// gửi mã đổi mật khẩu
const htmlResetPassword = (token) => {
  return `<div>
    ${headerHtmlMail}
    <h2 style="padding: 10px 0; margin-bottom: 10px;">
        Xin chào anh (chị),<br />
        Hama Instagram đã nhận được yêu cầu lấy lại mật khẩu từ bạn.<br />
        Đừng lo lắng, hãy nhập mã này để khôi phục:
    </h2>
    <h1 style="background: #eee;padding: 10px;">
      <i><b>${token}</b></i>
    </h1>
    ${footerHtmlVerifyMail}
  </div>`;
};

module.exports = {
  sendEmail,
  htmlResetPassword,
};
