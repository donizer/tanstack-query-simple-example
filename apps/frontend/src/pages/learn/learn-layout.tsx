import { Link, Outlet, useLocation } from "react-router-dom";
import { useIsFetching, useIsMutating, useQueryClient } from "@tanstack/react-query";
import { generateRandomNote } from "@/utils/noteGenerator";
import { useCreateNote } from "@/hooks/use-notes";
import { noteKeys } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navigationTabs = [
  { label: "Basic Query", value: "basic", to: "/learn/basic" },
  { label: "Suspense Query", value: "suspense", to: "/learn/suspense" },
  { label: "Pagination", value: "pagination", to: "/learn/pagination" },
  { label: "Infinite Query", value: "infinite", to: "/learn/infinite" },
  { label: "Terrible useEffect", value: "shitty-use-effect", to: "/learn/shitty-use-effect" },
] as const;

export function LearnLayout() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateNote();

  const activeTab =
    navigationTabs.find((tab) => location.pathname.startsWith(tab.to))?.value ?? navigationTabs[0].value;

  const fetchingNotesCount = useIsFetching({ queryKey: noteKeys.all });
  const mutatingNotesCount = useIsMutating({ mutationKey: noteKeys.mutations.all() });

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-8 md:px-6 lg:py-10'>
      <header className='flex flex-col gap-4'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight'>TanStack Query Notes Demo</h1>
            <p className='text-sm text-muted-foreground'>
              Compare common query patterns with the same Notes API and UI building blocks.
            </p>
          </div>

          {(fetchingNotesCount > 0 || mutatingNotesCount > 0) && (
            <Badge
              variant='secondary'
              className='inline-flex items-center gap-2 self-start md:self-auto'
            >
              <Spinner className='h-3 w-3' />
              {mutatingNotesCount > 0 ? "Applying optimistic update..." : "Syncing in background..."}
            </Badge>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            onClick={() => createNoteMutation.mutate(generateRandomNote())}
            // disabled={createNoteMutation.isPending}
          >
            {createNoteMutation.isPending ? (
              <>
                <Spinner className='mr-2 h-4 w-4' />
                Creating note...
              </>
            ) : (
              "Generate random note"
            )}
          </Button>

          <Button
            variant='outline'
            onClick={() => queryClient.invalidateQueries({ queryKey: noteKeys.all })}
          >
            Invalidate notes queries
          </Button>

          <Button
            variant='ghost'
            asChild
          >
            <Link to='/editor'>Open editor</Link>
          </Button>

          <Button
            variant='destructive'
            asChild
          >
            <Link to='/learn/shitty-use-effect'>⚠️ Summon The Legacy Effect Vortex</Link>
          </Button>
        </div>
      </header>

      <Tabs
        value={activeTab}
        className='w-full'
      >
        <TabsList>
          {navigationTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
            >
              <Link to={tab.to}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Outlet />
    </main>
  );
}
