"use client";



import { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import { Loader2, Sparkles, BookOpen } from "lucide-react";

import { useAuth, UserRole } from "@/hooks/use-auth";



import { Button } from "@/components/ui/button";

import {

  Form,

  FormControl,

  FormField,

  FormItem,

  FormLabel,

  FormMessage,

} from "@/components/ui/form";

import { Input } from "@/components/ui/input";


import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";



const formSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ.",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu phải dài ít nhất 6 ký tự.",
  }),
});



export default function LoginPage() {

  const { signIn, isLoading } = useAuth();



  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "minhan@studymate.vn",
      password: "password123",
    },
  });



  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signIn(values.email, values.password);
  }



  return (

    <div className="animate-fade-in-up">

      <Card className="border-0 shadow-pop bg-white/80 backdrop-blur-xl relative overflow-hidden">

        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--secondary)]"></div>

        <CardHeader className="space-y-3 pb-6 text-center">

          <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit mb-2 ring-1 ring-primary/20">

            <BookOpen className="w-8 h-8 text-primary" />

          </div>

          <CardTitle className="text-3xl font-extrabold tracking-tight">

            Chào mừng trở lại!

          </CardTitle>

          <CardDescription className="text-base font-medium text-muted-foreground">

            Đăng nhập để tiếp tục làm chủ kiến thức với <span className="font-semibold text-foreground">StudyMate</span>.

          </CardDescription>

        </CardHeader>

        <CardContent>

          <Form {...form}>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField

                control={form.control}

                name="email"

                render={({ field }: { field: any }) => (

                  <FormItem>

                    <FormLabel className="font-semibold">Địa chỉ Email</FormLabel>

                    <FormControl>

                      <Input

                        placeholder="hello@studymate.vn"

                        className="h-12 px-4 shadow-sm bg-white/50 focus-visible:ring-primary focus-visible:bg-white transition-all text-base rounded-xl"

                        {...field}

                      />

                    </FormControl>

                    <FormMessage />

                  </FormItem>

                )}

              />

              <FormField

                control={form.control}

                name="password"

                render={({ field }: { field: any }) => (

                  <FormItem>

                    <div className="flex items-center justify-between">

                      <FormLabel className="font-semibold">Mật khẩu</FormLabel>

                      <a href="#" className="text-sm font-medium text-primary hover:underline">Quên mật khẩu?</a>

                    </div>

                    <FormControl>

                      <Input

                        type="password"

                        placeholder="••••••••"

                        className="h-12 px-4 shadow-sm bg-white/50 focus-visible:ring-primary focus-visible:bg-white transition-all text-base rounded-xl"

                        {...field}

                      />

                    </FormControl>

                    <FormMessage />

                  </FormItem>

                )}

              />


              <Button

                type="submit"

                className="w-full h-12 text-base font-bold shadow-soft rounded-xl transition-all hover:shadow-pop relative overflow-hidden group"

                disabled={isLoading}

              >

                {isLoading ? (

                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />

                ) : (

                  <>

                    <Sparkles className="mr-2 h-5 w-5 text-primary-foreground/70 group-hover:text-primary-foreground transition-colors" />

                    Bắt đầu hành trình

                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform hidden group-hover:block" />

                  </>

                )}

              </Button>

            </form>

          </Form>

        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/40 pt-6">

          <p className="text-sm text-muted-foreground font-medium">

            Chưa có tài khoản?{" "}

            <a href="#" className="text-primary font-bold hover:underline transition-all">

              Đăng ký ngay

            </a>

          </p>

        </CardFooter>

      </Card>

    </div>

  );

}

