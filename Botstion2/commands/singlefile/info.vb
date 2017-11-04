﻿Imports Discord
Imports Discord.WebSocket

Module info
    Async Sub uinfoFunc(msg As IUserMessage, client As DiscordSocketClient, prefix As String)
        For Each channelid As ULong In msg.MentionedChannelIds
            Try
                Dim channel As IGuildChannel = TryCast(client.GetChannel(channelid), IGuildChannel)

            Catch ex As Exception

            End Try
        Next
        For Each userid As ULong In msg.MentionedUserIds
            Try
                Dim color As Color = Color.LighterGrey
                Dim fields As List(Of EmbedFieldBuilder) = New List(Of EmbedFieldBuilder)
                Dim user As IUser = client.GetUser(userid)
                fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":person_with_blond_hair: Username#Descrim", .Value = user.Username & user.Discriminator})
                fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = "  Mention", .Value = user.Mention})
                fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":id: ID", .Value = user.Id})
                fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":frame_photo: Profile Picture", .Value = "[Recommended](" & user.GetAvatarUrl(ImageFormat.Auto) & ") [GIF](" & user.GetAvatarUrl(ImageFormat.Gif) & ") [JPEG](" & user.GetAvatarUrl(ImageFormat.Jpeg) & ") [PNG](" & user.GetAvatarUrl(ImageFormat.Png) & ") [WebP](" & user.GetAvatarUrl(ImageFormat.WebP) & ")"})
                fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":calendar_spiral: Joined Discord", .Value = user.CreatedAt.ToString})
                If userid = client.CurrentUser.Id Then
                    fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":clock1: Bot Latency", .Value = client.Latency})
                    fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = "  Shard", .Value = client.ShardId})
                    fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":lock: Creator has MFA", .Value = client.CurrentUser.IsMfaEnabled})
                End If
                If user.Game.HasValue Then
                    If user.Game.Value.StreamType = StreamType.NotStreaming Then
                        fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":video_game: Game", .Value = user.Game.Value.Name})
                    Else
                        fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = "<:Streaming:375377712874913792> Streaming on " & user.Game.Value.StreamType.ToString, .Value = "[" & user.Game.Value.Name & "](" & user.Game.Value.StreamUrl & ")"})
                    End If
                End If
                fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = "<:Invis:375377712631644161> Status", .Value = user.Status})
                Try
                    Dim guilduser = Await TryCast(msg.Channel, IGuildChannel).GetUserAsync(userid)
                    Try
                        fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":guardsman: Botstion Role", .Value = (New permissionManager).getUserRoleByGU(guilduser)})
                    Catch ex As Exception
                        msg.Channel.SendMessageAsync(msg.Author.Mention, False, New EmbedBuilder With {
                                            .Author = New EmbedAuthorBuilder With {
                                                 .Name = "info: Error"
                                            },
                                            .Color = Color.DarkRed,
                                            .Description = ex.ToString,
                                            .Footer = Module1.getfooter(msg),
                                            .Title = "A " & ex.Message & " error occured",
                                            .Timestamp = DateTimeOffset.Now}.Build)
                    End Try
                    fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":calendar: Joined this server", .Value = guilduser.JoinedAt.ToString})
                    Try
                        fields.Add(New EmbedFieldBuilder With {.IsInline = True, .Name = ":pencil: Nickname", .Value = guilduser.Nickname})
                    Catch
                    End Try
                    Dim roles As String = ""
                        For Each roleid As ULong In guilduser.RoleIds
                            Dim role As IRole = guilduser.Guild.GetRole(roleid)
                            If Not role.IsManaged Then
                                If Not roles = "" Then
                                    roles = roles & ", "
                                End If
                                If role.IsHoisted Then
                                    roles = roles & "**"
                                End If
                                If role.IsMentionable Then
                                    roles = roles & "*"
                                End If
                                roles = roles & role.Name
                                If role.IsMentionable Then
                                    roles = roles & "*"
                                End If
                                If role.IsHoisted Then
                                    roles = roles & "**"
                                End If

                            End If
                        If Not role.Color.RawValue = 0 And color.RawValue = Color.LighterGrey.RawValue Then
                            color = role.Color
                        End If
                    Next
                    fields.Add(New EmbedFieldBuilder With {.IsInline = False, .Name = ":guardsman: Roles", .Value = roles})
                Catch ex As Exception
                    msg.Channel.SendMessageAsync(msg.Author.Mention, False, New EmbedBuilder With {
                                            .Author = New EmbedAuthorBuilder With {
                                                 .Name = "info: Error"
                                            },
                                            .Color = Color.DarkRed,
                                            .Description = ex.ToString,
                                            .Footer = Module1.getfooter(msg),
                                            .Title = "A " & ex.Message & " error occured",
                                            .Timestamp = DateTimeOffset.Now
                                            }.Build)
                End Try
                Dim statusIcon = ""
                If user.Game.HasValue Then
                    If user.Game.Value.StreamType = StreamType.Twitch Then
                        statusIcon = "<:Streaming:375377712874913792><:Twitch:375377712929308672>"
                    End If
                End If
                If user.Status = UserStatus.Idle And statusIcon = "" Then
                    statusIcon = "<:Away:375377712413540363>"
                ElseIf user.Status = UserStatus.DoNotDisturb And statusIcon = "" Then
                    statusIcon = "<:DND:375377716775485461>"
                ElseIf user.Status = UserStatus.Invisible And statusIcon = "" Then
                    statusIcon = "<:Invis:375377712631644161>"
                ElseIf user.Status = UserStatus.Offline And statusIcon = "" Then
                    statusIcon = "<:Offline:375377712589832203>"
                ElseIf user.Status = UserStatus.Online And statusIcon = "" Then
                    statusIcon = "<:Online:375377712753147904>"
                End If
                If user.IsBot Then
                    statusIcon = statusIcon & "<:BOT:375377712648421386>"
                End If
                Await msg.Channel.SendMessageAsync(msg.Author.Mention, False, New EmbedBuilder With {
                                           .Author = New EmbedAuthorBuilder With {
                                                 .Name = "User Info"
                                           },
                                           .Color = color,
                                           .Title = statusIcon & " " & user.Username,
                                           .Fields = fields,
                                           .Footer = getfooter(msg, " | Dates are in the format DD/MM/YYY HH:MM:SS +UTC_OFFSET"),
                                           .Timestamp = DateTimeOffset.Now,
                                           .ThumbnailUrl = user.GetAvatarUrl(ImageFormat.Auto)}.Build)
            Catch ex As Exception
                msg.Channel.SendMessageAsync(msg.Author.Mention, False, New EmbedBuilder With {
                                            .Author = New EmbedAuthorBuilder With {
                                                 .Name = "info: Error"
                                            },
                                            .Color = Color.DarkRed,
                                            .Description = ex.ToString,
                                            .Footer = Module1.getfooter(msg),
                                            .Title = "A " & ex.Message & " error occured",
                                            .Timestamp = DateTimeOffset.Now}.Build)
            End Try
        Next
    End Sub
    Function init()
        Module1.commands.Add(New mainclasses.modulecommand With {
                             .name = "info",
                             .descrip = "Shows you info about a user/channel/role",
                             .example = "info <@80351110224678912>",
                             .func = AddressOf uinfoFunc,
                             .permission = permissionManager.BotstionRole.regular
        })
        Log(New LogMessage(LogSeverity.Info, "Init", "Loaded info."))
        Return True
    End Function
End Module
