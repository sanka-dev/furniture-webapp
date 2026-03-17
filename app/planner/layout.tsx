export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        header { display: none !important; }
        footer { display: none !important; }
        main { min-height: auto !important; }
      `}</style>
      {children}
    </>
  );
}
