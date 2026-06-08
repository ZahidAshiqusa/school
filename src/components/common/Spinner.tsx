export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' }[size];
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full ${sizeClass} border-4 border-primary border-t-transparent`} />
    </div>
  );
}
