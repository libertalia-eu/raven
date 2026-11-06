import { LayoutGrid } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@components/ui/dropdown-menu"
import { useApps } from "@hooks/useApps"
import _ from "@lib/translate"

/** Switch to the other apps of the site, in the same tab, like the apps menu of Helpdesk and CRM. */
const AppsSubMenu = () => {
    const apps = useApps()

    if (apps.length === 0) return null

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <LayoutGrid />
                <span>{_("Apps")}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                {apps.map((app) => (
                    <DropdownMenuItem key={app.name} onClick={() => { window.location.href = app.route }}>
                        <img src={app.logo} alt="" className="size-4 rounded-sm" />
                        <span>{app.title}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}

export default AppsSubMenu
