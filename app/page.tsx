import { TaskHeader } from "@/components/task-header"
import { TaskSections } from "@/components/task-sections"
import { DailyCalendar } from "@/components/daily-calendar"
import { TasksProvider } from "@/contexts/TasksContext"
import { SectionsProvider } from "@/contexts/SectionsContext"

export default function TasksPage() {
  return (
    <TasksProvider>
      <SectionsProvider>
        <div className="min-h-screen bg-background">
          <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
            <TaskHeader />

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
              <TaskSections />
              <div className="lg:sticky lg:top-8 lg:h-fit">
                <DailyCalendar />
              </div>
            </div>
          </div>
        </div>
      </SectionsProvider>
    </TasksProvider>
  )
}
