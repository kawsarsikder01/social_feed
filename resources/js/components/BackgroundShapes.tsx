interface Shape {
  key: string;
  wrapperClass: string;
  lightSrc: string;
  darkSrc: string;
  darkClass: string;
}

/**
 * Purely decorative background shapes.
 * Kept as static data so adding/removing a shape is a one-line change.
 */
const SHAPES: Shape[] = [
  {
    key: "shape-one",
    wrapperClass: "_shape_one",
    lightSrc: "/assets/images/shape1.svg",
    darkSrc: "/assets/images/dark_shape.svg",
    darkClass: "_dark_shape",
  },
  {
    key: "shape-two",
    wrapperClass: "_shape_two",
    lightSrc: "/assets/images/shape2.svg",
    darkSrc: "/assets/images/dark_shape1.svg",
    darkClass: "_dark_shape _dark_shape_opacity",
  },
  {
    key: "shape-three",
    wrapperClass: "_shape_three",
    lightSrc: "/assets/images/shape3.svg",
    darkSrc: "/assets/images/dark_shape2.svg",
    darkClass: "_dark_shape _dark_shape_opacity",
  },
];

export default function BackgroundShapes() {
  return (
    <>
      {SHAPES.map(({ key, wrapperClass, lightSrc, darkSrc, darkClass }) => (
        <div className={wrapperClass} key={key}>
          <img src={lightSrc} alt="" className="_shape_img" />
          <img src={darkSrc} alt="" className={darkClass} />
        </div>
      ))}
    </>
  );
}