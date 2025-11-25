import { Spinner } from "@/components/ui/shadcn-io/spinner";

export const Loading = () => {
  return (
    <div className="flex w-dvw h-dvh items-center justify-center">
      <Spinner
        variant="ellipsis"
        className=" w-full h-dvh text-indigo-400 scale-10"
      />
    </div>
  );
};
