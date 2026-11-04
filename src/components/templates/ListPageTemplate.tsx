type ListPageTemplateProps = {
  title: string
  toolbar: React.ReactNode
  children: React.ReactNode
}

// Layout only: the page fills the slots, so the template never touches data
export function ListPageTemplate({ title, toolbar, children }: ListPageTemplateProps) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        {toolbar}
      </div>
      {children}
    </>
  )
}
