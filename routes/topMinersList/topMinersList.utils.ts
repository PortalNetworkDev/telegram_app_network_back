export const getLimit = (value: number) => {
    if (value > 50) {
      return 50;
    }
  
    if (value < 30) {
      return 30;
    }
  
    return value;
  };