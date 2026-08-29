import type { CSSProperties, ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function Image({ fill, priority, style, className, alt = "", loading, ...props }: Props) {
  const mergedStyle: CSSProperties = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }
    : { ...style };

  return (
    <img
      alt={alt}
      loading={priority ? "eager" : (loading ?? (props.src ? "lazy" : undefined))}
      className={className}
      style={mergedStyle}
      {...props}
    />
  );
}
