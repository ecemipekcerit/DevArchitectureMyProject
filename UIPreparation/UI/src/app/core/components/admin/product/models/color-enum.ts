export enum Color {

  Black = 1,
  White = 2,
  Green = 3,
  Blue = 4,
  Red = 5,
  Yellow = 6
}

export const QualityControlTypeEnumLabelMappingColor: Record<Color, string> = {
  [Color.Black]: "Black",
  [Color.White]: "White",
  [Color.Green]: "Green",
  [Color.Blue]: "Blue",
  [Color.Red]: "Red",
  [Color.Yellow]: "Yellow"
}

// export enum Color {
//     black = 'Siyah',
//     white ='Beyaz',
//     green = 'Yeşil',
//     blue = 'Mavi',
//     red = 'Kırmızı',
//     yellow = 'Sarı',
//   }

//   export const ColorList: {
//     key: string;
//     value: string;
//   }[] = Object.entries(Color)
//     .map(([key, value]) => ({ key, value }));