import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { Dot, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import TeacherHeader from '@/components/teachers/header';
import { teachersData } from '@/lib/fake-data/teachers';
import cardData from '@/lib/data';
import BreadcrumbComponent from '@/components/breadcrumb';
import { useMainContext } from '@/context/main-context';
import GroupCard from '@/components/groups/card';
import EditDialog from '@/components/dialogs/edit-dialog';
import GroupEdit from '@/components/groups/edit';
import DeleteAlert from '@/components/dialogs/delete-alert';
import FilterGroups from '@/components/groups/filter';

const Teacher = () => {
  const { groups, courses, teachers } = useMainContext();
  const { teacherId } = useParams();

  const teacher = teachersData.find((t) => t.id === parseInt(teacherId));

  const [openGroupEditDialog, setOpenGroupEditDialog] = useState(false);
  const [openGroupDeleteDialog, setOpenGroupDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('title');

  // You should put teacher's group right here.
  const filteredGroups = groups.filter((group) => {
    switch (filterOption) {
      case 'title':
        return courses
          .filter((item) => item.id === group.courseId)[0]
          .courseTitle.toLowerCase()
          .includes(searchTerm.toLowerCase());
      case 'teacher':
        return teachers
          .filter((item) => item.id === group.teacherId)[0]
          .fullName.toLowerCase()
          .includes(searchTerm.toLowerCase());
      default:
        return false;
    }
  });

  if (!teacher) {
    return (
      <div className="px-4 lg:px-8 mx-auto py-4">
        <h2 className="text-2xl font-bold tracking-tight">404 error</h2>
        <p className="text-muted-foreground">
          Siz qidirayotgan guruh topilmadi!
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 mx-auto my-4 space-y-4">
      <BreadcrumbComponent
        title="O'qituvchilar ro'yxati"
        titleLink="/teachers"
        subtitle="John Doe"
      />
      <TeacherHeader teacher={teacher} />

      <EditDialog open={openGroupEditDialog} setOpen={setOpenGroupEditDialog}>
        <GroupEdit />
      </EditDialog>

      <DeleteAlert
        open={openGroupDeleteDialog}
        setOpen={setOpenGroupDeleteDialog}
      />

      <FilterGroups
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOption={filterOption}
        setFilterOption={setFilterOption}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((card) => (
          <Link key={card.id} to={`/groups/${card.id}`}>
            <GroupCard
              card={card}
              setOpenDelete={setOpenGroupDeleteDialog}
              setOpenEdit={setOpenGroupEditDialog}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Teacher;
