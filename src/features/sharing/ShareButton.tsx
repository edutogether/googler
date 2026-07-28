import type { ButtonHTMLAttributes, ReactNode } from 'react';
type ShareButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };
export function ShareButton({ children, ...props }: ShareButtonProps) { return <button {...props}>{children}</button>; }
