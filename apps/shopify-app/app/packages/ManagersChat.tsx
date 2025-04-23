import { useState } from "react";
import { Chat } from "app/components/chat/Chat";
import { IMessage, MessageRole } from "../../../../packages/types/src";

export const ManagersChat = (props: { messages: IMessage[] }) => {
  const { messages } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [messagesList, setMessagesList] = useState<IMessage[]>(messages);

  const handleSubmit = (message: string) => {};

  return (
    <Chat
      watcherRole={MessageRole.MANAGER}
      messagesList={messagesList}
      isLoading={isLoading}
      onSend={handleSubmit}
    ></Chat>
  );
};
