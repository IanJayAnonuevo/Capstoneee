import React from 'react';

const Skeleton = ({ className, variant = "text", ...props }) => {
    const baseClasses = "animate-pulse bg-gray-200";

    let variantClasses = "";
    if (variant === "text") {
        variantClasses = "h-4 w-full rounded";
    } else if (variant === "circular") {
        variantClasses = "rounded-full";
    } else if (variant === "rectangular") {
        variantClasses = "rounded";
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses} ${className || ''}`}
            {...props}
        />
    );
};

export default Skeleton;
