
module.exports = {
    counter: async function setNum(num)
    {
      if(num > 1000)
      {
        return false;
      }
      else if(num<1000 && num > 99)
      {
        return num.toString();
      }
      else if(num < 100 && num > 9)
      {
        return "0"+num;
      }
      else
      {
        return "00"+num;
      }
    }
}