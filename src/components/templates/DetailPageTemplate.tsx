type DetailPageTemplateProps = {
  title: string
  children: React.ReactNode
  aside: React.ReactNode
}

// Two columns on large screens: the main content, and a narrow sidebar
export function DetailPageTemplate({ title, children, aside }: DetailPageTemplateProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <section className="grid content-start gap-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </section>

      <aside className="grid content-start gap-6">{aside}</aside>
    </div>
  )
}
