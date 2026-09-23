import { Building2, Check, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth/AuthContext';

const initials = (name?: string) => (name?.trim()?.[0] ?? '?').toUpperCase();

export function AppHeader() {
  const { user, logout, monitoringPairs, activePair, setActivePair } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />

      {monitoringPairs.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="max-w-[60vw] gap-2 px-2">
              <Building2 className="text-muted-foreground" />
              <span className="truncate font-medium">{activePair?.base_company.company_name ?? 'Select company'}</span>
              {activePair?.is_expired && <Badge variant="muted">Expired</Badge>}
              <ChevronDown className="opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>Monitored company</DropdownMenuLabel>
            {monitoringPairs.map((pair) => (
              <DropdownMenuItem key={pair.pair_id} onSelect={() => setActivePair(pair)} className="gap-2">
                <Check className={activePair?.pair_id === pair.pair_id ? 'opacity-100' : 'opacity-0'} />
                <span className="flex-1 truncate">{pair.base_company.company_name}</span>
                {pair.is_expired && <Badge variant="muted">Expired</Badge>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2" aria-label="Account menu">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-sm text-primary-foreground">{initials(user.username)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">{user.username}</span>
              <ChevronDown className="hidden opacity-60 sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium">{user.username}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-2">{user.role.name}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
