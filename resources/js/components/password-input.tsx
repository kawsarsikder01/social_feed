import React from 'react';

export default function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input type="password" className={className} {...props} />;
}
