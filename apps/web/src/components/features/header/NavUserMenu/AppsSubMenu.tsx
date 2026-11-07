import { LayoutGrid } from "lucide-react"
import { DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@components/ui/dropdown-menu"
import { useApps } from "@hooks/useApps"
import _ from "@lib/translate"

/** The window name makes a second click reuse the window; `noopener` would ignore the name, so the opener is cut afterwards. */
const openApp = (app: { name: string; route: string }) => {
    const target = window.open(app.route, `compass-${app.name}`)
    try {
        if (target) target.opener = null
    } catch (e) {
        // a reused window of another host has the opener cut already
    }
}

/** Switch to the other apps of the site, each in its own window, like the apps menu of Helpdesk and CRM. */
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
                    <DropdownMenuItem key={app.name} onClick={() => openApp(app)}>
                        <img src={app.logo} alt="" className="size-4 rounded-sm" />
                        <span>{app.title}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    )
}

export default AppsSubMenu
