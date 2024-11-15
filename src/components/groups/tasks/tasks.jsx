import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '@/api/firebase';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AddTaskDialog from '@/components/dialogs/add-task';
import { format } from 'date-fns';

function Tasks({ groupId, adminId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const ref = collection(db, `users/${adminId}/groups/${groupId}/tasks`);
      const querySnapshot = await getDocs(ref);

      const taskList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(taskList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [adminId, groupId]);

  function formatDate(timestamp) {
    const { seconds, nanoseconds } = timestamp;
    const date = new Date(seconds * 1000 + nanoseconds / 1000000);
    return format(date, 'dd.MM.yyyy');
  }

  return (
    <div className="space-y-2 pt-2">
      <AddTaskDialog
        open={open}
        setOpen={setOpen}
        groupId={groupId}
        fetchTasks={fetchTasks}
      />
      <div className="flex items-center">
        <div className="relative">
          <Input
            className="peer pe-9 ps-9 w-full lg:w-96"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Vazifalarni qidirish..."
            type="search"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search size={16} strokeWidth={2} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[50rem] w-full">
          {loading && (
            <TableCaption className="bg-muted/50 py-5 mt-0">
              Loading...
            </TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead className="w-80 rounded-tl-md">Title</TableHead>
              <TableHead className="text-center">Due date</TableHead>
              <TableHead className="text-center">Attachments</TableHead>
              <TableHead className="text-center">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow>
                <Link to={`/groups/${groupId}/task/${task.id}`}>
                  <TableCell className="w-80">
                    <h1 className="text-base font-medium w-80 truncate">
                      {task.title}
                    </h1>
                    <p className="text-sm text-muted-foreground w-80 truncate">
                      {task.description}
                    </p>
                  </TableCell>
                </Link>
                <TableCell className="text-center">
                  {formatDate(task.due)}
                </TableCell>
                <TableCell className="text-center">
                  {task?.images ? task?.images?.length : 0} attachments
                </TableCell>
                <TableCell className="flex items-center justify-center">
                  <Link to={`/groups/${groupId}/task/${task.id}`}>
                    <Button variant="link">
                      <Eye className="w-5 h-5" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Tasks;
