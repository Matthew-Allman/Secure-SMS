const UUIDKeygen = () => {
  const idStrLen = 20;
  let idStr = "";

  while (idStr.length < idStrLen) {
    idStr += Math.floor(Math.random() * 35).toString(36);
  }

  return idStr;
};

const keygen = () => {
  const idStrLen = 19;
  let idStr = "";

  while (idStr.length < idStrLen) {
    idStr += Math.floor(Math.random() * 35).toString(36);
  }

  idStr = idStr.slice(0, 9) + "-" + idStr.slice(10, 19);

  return idStr;
};

module.exports = { UUIDKeygen, keygen };
