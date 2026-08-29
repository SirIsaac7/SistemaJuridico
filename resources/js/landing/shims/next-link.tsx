import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export default function Link({ href, children, ...props }: Props) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
