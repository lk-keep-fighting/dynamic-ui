import { ConversationPlanner } from "@/components/ai/conversation-planner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>AI 对话式界面生成</CardTitle>
          <CardDescription>
            通过连续对话描述业务场景，系统会为你规划数据模型、操作与交互模式，并实时渲染预览。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConversationPlanner />
        </CardContent>
      </Card>
    </div>
  );
}
