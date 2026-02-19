import { Toggle } from "./toggle"




export function ButtonGroup() {
var content = [ "Projects" , "Chats" , "Workspaces" , "Calendar"
    , "Tasks" , "Time Tracking" , "Dashboards" , "Scheduling"
    ]
 
    return ( 
        <div className="flex flex-wrap gap-2">
        {content.map((item) => (
          <Toggle className="" size="sm" variant="hero" key={item}>
            {item}
          </Toggle>
        ))}
      </div>

    )
}