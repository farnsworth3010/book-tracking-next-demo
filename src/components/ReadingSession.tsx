import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReadingSessionStore } from '@/stores/readingSessionStore'

// observer re-renders this component when any observable it read during render changes
export const ReadingSession = observer(function ReadingSession() {
  // One store per mounted component: the initializer runs on mount only, not on every render
  const [session] = useState(() => new ReadingSessionStore())

  // The store owns an interval, so unmount must stop it (StrictMode checks this cleanup right after mount)
  useEffect(() => () => session.pause(), [session])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading session</CardTitle>
        <CardDescription>MobX demo</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-3xl font-semibold tabular-nums">{session.elapsed}</p>
        <div className="text-sm text-muted-foreground">
          <p>Pages read: {session.pages}</p>
          <p>Pace: {session.pagesPerHour} pages/hour</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.running ? (
            <Button size="sm" onClick={() => session.pause()}>
              Pause
            </Button>
          ) : (
            <Button size="sm" onClick={() => session.start()}>
              Start
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => session.addPage()}>
            +1 page
          </Button>
          <Button size="sm" variant="ghost" onClick={() => session.reset()}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
