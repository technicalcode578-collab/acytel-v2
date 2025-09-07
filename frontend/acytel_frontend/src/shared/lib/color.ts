export const getDominantColor = (imageUrl: string): Promise<[number, number, number]> => {
  return new Promise((resolve) => {
    const colors = [
      [17, 85, 102],
      [188, 8, 8],
      [80, 100, 120],
      [140, 25, 95],
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    resolve(randomColor as [number, number, number]);
  });
};