type FormPageTemplateProps = {
  title: string
  children: React.ReactNode
}

// One narrow centered column, for pages that are a single form
export function FormPageTemplate({ title, children }: FormPageTemplateProps) {
  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {children}
    </div>
  )
}
