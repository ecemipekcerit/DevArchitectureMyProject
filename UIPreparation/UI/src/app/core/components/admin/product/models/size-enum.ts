export enum Size {

    S = 1,
    M = 2,
    L = 3,
    XL = 4
}

export const QualityControlTypeEnumLabelMappingSize: Record<Size, string> = {
    [Size.S]: "Small",
    [Size.M]: "Medium",
    [Size.L]: "Large",
    [Size.XL]: "XLarge"
}

/*export enum Size {
    Small = { value: "S", label: "Small" },
    Medium = { value: "M", label: "Medium" },
    Large = { value: "L", label: "Large" },
    XLarge = { value: "XL", label: "XLarge" }
  }*/// export const SizeList: {
//     key: string;
//     value: string;
//   }[] = Object.entries(Size)
//     .map(([key, value]) => ({ key, value }));