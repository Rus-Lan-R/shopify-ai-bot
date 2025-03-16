export const createFileFromObject = ({
  name,
  obj,
}: {
  name: string;
  obj: {};
}) => {
  const file = new File(
    [Buffer.from(JSON.stringify(obj, null, 2), "utf-8")],
    name,
    {
      type: "application/json",
    }
  );

  return file;
};
