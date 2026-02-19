import { Button } from "./button"




export function ButtonGroup() {
var content = [ "Projects" , "Chats" , "Workspaces" , "Calendar"
    , "Tasks" , "Time Tracking" , "Dashboards" , "Scheduling"
    ]
 
    return ( 
        <div className="flex gap-2">
        {content.map((item) => (
          <Button className="" size="xs" variant="outline" key={item}>
            {item}
          </Button>
        ))}
      </div>

    )
}