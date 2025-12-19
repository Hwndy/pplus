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
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, User, LogOut, Clock, CheckCircle } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  const { user, logout, activePair, monitoringPairs, setActivePair } = useAuth();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Editorial Submission',
      message: 'John Doe submitted a new editorial for review',
      time: '2 minutes ago',
      read: false,
      type: 'editorial'
    },
    {
      id: 2,
      title: 'Daily Mention Approved',
      message: 'Your daily mention about Access Bank has been approved',
      time: '1 hour ago',
      read: false,
      type: 'approval'
    },
    {
      id: 3,
      title: 'SWOT Analysis Updated',
      message: 'SWOT analysis for Q4 has been updated with new insights',
      time: '3 hours ago',
      read: true,
      type: 'update'
    },
    {
      id: 4,
      title: 'Report Generated',
      message: 'Monthly analytics report is ready for download',
      time: '1 day ago',
      read: true,
      type: 'report'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  if (!user) return null;

  // Safe fallback letters
  const getFallbackLetter = (str?: string) => {
    return str && str.trim() ? str.trim()[0].toUpperCase() : '?';
  };

  const activeCompanyLetter = activePair?.base_company.company_name
    ? getFallbackLetter(activePair.base_company.company_name)
    : getFallbackLetter(user.name);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        {children}
        <div className="hidden md:flex items-center gap-3">
          <h1 className="text-lg font-semibold">P+Analytics Dashboard</h1>
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
          <h1 className="text-lg font-semibold">P+</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* <div className="hidden md:flex relative"> */}
          {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" */}
          {/* /> */}
        {/* </div> */}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="btn-icon relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6 px-2">
                  Mark all read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                      !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && <Badge variant="secondary" className="text-xs">New</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mb-1 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            {notifications.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-blue-600 hover:text-blue-800">
                  View all notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="btn-icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* Profile & Company Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getFallbackLetter(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {/* Current Active Company */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {activeCompanyLetter}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {activePair?.base_company.company_name || 'No company selected'}
                </p>
                <p className="text-xs text-muted-foreground">{user.name} • {user.email}</p>
              </div>
              {activePair && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>

            {/* Switch Company */}
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
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pair.base_company.company_name}</p>
                  </div>
                  {activePair?.pair_id === pair.pair_id && (
                    <CheckCircle className="h-4 w-4 text-primary" />
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
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
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