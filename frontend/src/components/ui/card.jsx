import { cn } from "../../lib/utils";

const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm",
      className
    )}
    {...props}
  />
);
Card.displayName = "Card";

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6", className)} {...props} />
);
CardContent.displayName = "CardContent";

export { Card, CardContent }; 
