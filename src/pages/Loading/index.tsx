import { Spinner } from "@/components/ui/shadcn-io/spinner";

export const Loading = () => {
  return (
    <div className="container flex w-dvw h-dvh">
      <Spinner
        variant="ellipsis"
        className=" w-full h-dvh text-indigo-400 scale-10"
      />
    </div>
  );
};
