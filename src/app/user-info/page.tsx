import { auth } from "@/auth"


export default async function UserInfo() {
    const session = await auth()
  return (
    <div>
      Just a page that needs protection as it lives in India
      <p>{session?.user?.name} is Here to Save</p>
    </div>
  )
}
