import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, LogOut, Menu, User } from 'lucide-react';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  const { user, logout, activePair, monitoringPairs, setActivePair } = useAuth();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

  if (!user) return null;

  const getFallbackLetter = (str?: string) => {
    return str && str.trim() ? str.trim()[0].toUpperCase() : '?';
  };

  const activeCompanyLetter = activePair?.base_company.company_name
    ? getFallbackLetter(activePair.base_company.company_name)
    : getFallbackLetter(user.name);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        {children}
        <div className="hidden md:flex items-center gap-3">
          <img 
                  src="/uploads/logo.png" 
                  alt="Analytics illustration" 
                  className="w-17 h-10"
                />
          {activePair && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm font-medium text-foreground">
                {activePair.base_company.company_name}
              </span>
            </>
          )}
        </div>
        <div className="flex md:hidden">
          <img 
                  src="/uploads/logo.png" 
                  alt="Analytics illustration" 
                  className="w-17 h-10"
                />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile & Company Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getFallbackLetter(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {activeCompanyLetter}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {activePair?.base_company.company_name || 'No company selected'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.name} • {user.email}
                </p>
              </div>
              {activePair && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />}
            </div>

            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-4 pt-4">
              Switch monitoring company
            </DropdownMenuLabel>

            {monitoringPairs.length > 0 ? (
              monitoringPairs.map((pair) => (
                <DropdownMenuItem
                  key={pair.pair_id}
                  onClick={() => setActivePair(pair)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getFallbackLetter(pair.base_company.company_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pair.base_company.company_name}</p>
                  </div>
                  {activePair?.pair_id === pair.pair_id && (
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No monitoring companies assigned
              </div>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}