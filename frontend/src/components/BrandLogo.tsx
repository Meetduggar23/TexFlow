interface BrandLogoProps {
  alt?: string;
  className?: string;
}

export default function BrandLogo({ alt = 'TexFlow', className }: BrandLogoProps) {
  return <img src="/logo.png" alt={alt} className={className} />;
}
