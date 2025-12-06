import { AppSidebar } from "@/components/SideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { getUserData, type PersonalUser } from "@/hooks/getUserData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { ApiURL } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateSubmissionModal } from "../components/CreateSubmissionModal";

type Activity = {
  id: number;
  id_class: number;
  title: string;
  description: string;
  type: string;
  max_grade: string;
  due_date: string;
};

type Submission = {
  id_student: string;
  id_activity: number;
  submitted_at: string;
  content: string;
};

export const Activity = () => {
  const [user, setUser] = useState<PersonalUser | null>(null);
  const [activitiesByClass, setActivitiesByClass] = useState<Activity[][]>([]);
  const [filteredActivitiesByClass, setFilteredActivitiesByClass] = useState<
    Activity[][]
  >([]);
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  useEffect(() => {
    const fetchMyActivities = async () => {
      if (user) {
        try {
          const requests = user.enrolments.map((enrolment) =>
            axios.get<Activity[]>(
              `${ApiURL}/api/activities/${enrolment.classId}`,
              { withCredentials: true }
            )
          );

          const responses = await Promise.all(requests);
          const classesData = responses.map((response) => response.data);

          setActivitiesByClass(classesData);
          setFilteredActivitiesByClass(classesData);
        } catch (error) {
          console.log(error);
        }
      }
    };

    const fetchMySubmissions = async () => {
      if (user) {
        const submissions = await axios.get<Submission[]>(
          `${ApiURL}/api/submissions/${user.id}`,
          { withCredentials: true }
        );

        setUserSubmissions(submissions.data);
      }
    };

    fetchMySubmissions();
    fetchMyActivities();
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const results = activitiesByClass.map((activities) =>
      activities.filter(
        (act) =>
          act.title.toLowerCase().includes(query) ||
          act.description.toLowerCase().includes(query) ||
          act.type.toLowerCase().includes(query)
      )
    );

    setFilteredActivitiesByClass(results);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <SidebarProvider>
      <AppSidebar profile="Aluno" />
      <main className="w-full bg-gray-800 flex flex-col items-center justify-start gap-3 p-5">
        <SidebarTrigger className="hidden" />

        {/* Header */}
        <section id="header" className="w-full">
          <div className="w-full m-5">
            <div className="flex flex-col start">
              <p className="text-2xl text-emerald-400 font-bold">
                Minhas atividades
              </p>
            </div>
          </div>
        </section>

        {/* Search */}
        <section id="search-bar" className="w-full pl-5 pr-5">
          <Card className="bg-gray-800">
            <CardContent>
              <Input
                placeholder="Buscar atividades"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-gray-700 text-white"
              />
            </CardContent>
          </Card>
        </section>

        {/* Conteúdo */}
        <section
          id="content"
          className="w-full flex flex-col items-center justify-center gap-4"
        >
          {filteredActivitiesByClass.map((activities) => {
            if (activities.length === 0) return null;

            const classId = activities[0].id_class;
            const className = user?.enrolments.find(
              (e) => e.classId === classId
            )?.className;
            const courseName = user?.enrolments.find(
              (e) => e.classId === classId
            )?.courseName;

            return (
              <Card key={classId} className="w-[83.5em] bg-gray-700">
                <CardHeader>
                  <CardTitle className="text-emerald-400">
                    {className} — {courseName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {activities.map((act) => {
                    const alreadySubmitted = userSubmissions.some(
                      (s) =>
                        s.id_activity === act.id && s.id_student === user?.id
                    );

                    const alreadyHasGrade = user?.grades.some(
                      (g) => g.activityId === act.id
                    );

                    const expired = act.due_date.split("T")[0] < today;
                    return (
                      <Card
                        key={act.id}
                        className="bg-gray-800 border border-gray-600 flex items-center flex-row justify-between"
                      >
                        <CardContent>
                          <CardHeader>
                            <CardTitle className="text-white">
                              {act.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-2 text-gray-300">
                            <p>{act.description}</p>
                            <div className="flex gap-2 flex-wrap">
                              <Badge className="bg-blue-500">{act.type}</Badge>
                              <Badge className="bg-purple-500">
                                Nota Máx: {act.max_grade}
                              </Badge>
                              <Badge
                                className={
                                  expired ? "bg-red-500" : "bg-emerald-600"
                                }
                              >
                                Prazo: {act.due_date.split("T")[0]}
                              </Badge>
                            </div>
                          </CardContent>
                        </CardContent>

                        <CardContent>
                          <CreateSubmissionModal
                            trigger={
                              <Button
                                className="bg-emerald-700 cursor-pointer"
                                disabled={
                                  expired || alreadySubmitted || alreadyHasGrade
                                }
                              >
                                Realizar atividade
                              </Button>
                            }
                            activity={{
                              id: act.id,
                              title: act.title,
                              classId: act.id_class,
                            }}
                            userId={user!.id}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </SidebarProvider>
  );
};
