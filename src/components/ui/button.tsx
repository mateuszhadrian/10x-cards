import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:outline-[3px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:opacity-80",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 active:opacity-80",
        outline: "border border-border bg-background hover:bg-muted active:bg-muted/80 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost: "hover:bg-muted active:bg-muted/80",
        link: "text-primary underline-offset-4 hover:underline hover:opacity-70",
      },
      size: {
        default: "h-8 px-4 text-[15px] leading-8",
        sm: "h-7 px-3 text-[13px] leading-7",
        lg: "h-11 px-5 text-[17px] leading-[2.75rem]",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
