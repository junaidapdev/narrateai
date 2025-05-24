"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { getProfile, type Profile } from "@/services/profile-service"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      setIsLoading(true)
      const profileData = await getProfile(user.id)
      setProfile(profileData)
      setIsLoading(false)
    }

    if (!authLoading) {
      fetchProfile()
    }
  }, [user, authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-8 md:grid-cols-[1fr_3fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "User"} />
                  <AvatarFallback>
                    {profile?.first_name?.[0]}
                    {profile?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>
                {profile?.first_name} {profile?.last_name}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardFooter>
              <SignOutButton />
            </CardFooter>
          </Card>
        </div>
        <div>
          <Tabs defaultValue="personal-info">
            <TabsList className="mb-4">
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="personal-info">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="grid gap-2">
                      <div className="font-medium">First Name</div>
                      <div className="text-sm text-muted-foreground">{profile?.first_name || "Not set"}</div>
                    </div>
                    <div className="grid gap-2">
                      <div className="font-medium">Last Name</div>
                      <div className="text-sm text-muted-foreground">{profile?.last_name || "Not set"}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => router.push("/profile/personal-info")}>Edit Personal Information</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <div className="font-medium">Password</div>
                      <div className="text-sm text-muted-foreground">••••••••</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => router.push("/profile/security")}>Change Password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
