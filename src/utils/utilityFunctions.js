const validEmail = (email) => {
  const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return pattern.test(email);
};

const validName = (name) => {
  const regex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  return regex.test(name);
};

const validPhone = (phone) => {
  const regex = /^\d{10}$/;
  return regex.test(phone);
};

function generateRandomString() {
  const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

module.exports = {
  validEmail,
  validName,
  validPhone,
  generateRandomString,
};
