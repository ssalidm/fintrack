// import { zodResolver } from '@hookform/resolvers/zod'
// import {
//   LoaderCircle,
//   Pencil,
//   X,
// } from 'lucide-react'

// import type {  ReactNode} from 'react'

// import {
//   useMemo,
//   useState,
// } from 'react'
// import { useForm } from 'react-hook-form'

// import { ApiClientError } from '../../../api/ApiClientError'
// import type { UserProfile } from '../api/types'
// import { useUpdateProfile } from '../hooks/useProfileMutations'
// import {
//   profileDetailsSchema,
//   type ProfileDetailsFormValues,
// } from '../validation/profileSchemas'

// interface ProfileDetailsCardProps {
//   profile: UserProfile
// }

// const fallbackTimeZones = [
//   'Africa/Johannesburg',
//   'Africa/Cairo',
//   'Africa/Lagos',
//   'Africa/Nairobi',
//   'America/New_York',
//   'Asia/Dubai',
//   'Asia/Kolkata',
//   'Australia/Sydney',
//   'Europe/London',
//   'Europe/Paris',
//   'UTC',
// ]

// function getTimeZones(
//   currentTimeZone: string,
// ) {
//   const extendedIntl =
//     Intl as typeof Intl & {
//       supportedValuesOf?: (
//         key: 'timeZone',
//       ) => string[]
//     }

//   const supportedTimeZones =
//     extendedIntl.supportedValuesOf?.(
//       'timeZone',
//     ) ?? fallbackTimeZones

//   return Array.from(
//     new Set([
//       currentTimeZone,
//       ...supportedTimeZones,
//     ]),
//   ).sort()
// }

// export default function ProfileDetailsCard({
//   profile,
// }: ProfileDetailsCardProps) {
//   const updateProfile =
//     useUpdateProfile()

//   const [
//     isOpen,
//     setIsOpen,
//   ] = useState(false)

//   const [
//     formError,
//     setFormError,
//   ] = useState<string | null>(
//     null,
//   )

//   const timeZones = useMemo(
//     () =>
//       getTimeZones(
//         profile.timeZone,
//       ),
//     [profile.timeZone],
//   )

//   const form =
//     useForm<ProfileDetailsFormValues>({
//       resolver: zodResolver(
//         profileDetailsSchema,
//       ),
//       defaultValues: {
//         firstName:
//           profile.firstName,
//         lastName:
//           profile.lastName,
//         preferredName:
//           profile.preferredName ??
//           '',
//         timeZone:
//           profile.timeZone,
//       },
//     })

//   function openDialog() {
//     form.reset({
//       firstName:
//         profile.firstName,
//       lastName:
//         profile.lastName,
//       preferredName:
//         profile.preferredName ??
//         '',
//       timeZone:
//         profile.timeZone,
//     })

//     setFormError(null)
//     setIsOpen(true)
//   }

//   function closeDialog() {
//     if (
//       updateProfile.isPending
//     ) {
//       return
//     }

//     setFormError(null)
//     setIsOpen(false)
//   }

//   async function submitProfile(
//     values: ProfileDetailsFormValues,
//   ) {
//     setFormError(null)

//     try {
//       await updateProfile.mutateAsync({
//         version:
//           profile.version,
//         firstName:
//           values.firstName,
//         lastName:
//           values.lastName,
//         preferredName:
//           values.preferredName.trim(),
//         timeZone:
//           values.timeZone,
//       })

//       setIsOpen(false)
//     } catch (error) {
//       setFormError(
//         error instanceof
//           ApiClientError
//           ? error.message
//           : 'Unable to update your profile.',
//       )
//     }
//   }

//   const inputClassName = `
//     mt-2
//     h-10
//     w-full
//     rounded-lg
//     border border-line
//     bg-surface
//     px-3.5
//     text-sm
//     text-ink
//     outline-none
//     transition
//     placeholder:text-subtle
//     focus:border-accent
//     focus:ring-2
//     focus:ring-accent/15
//     disabled:bg-surface-muted
//   `

//   return (
//     <>
//       <section className="rounded-2xl border border-line bg-surface">
//         <div className="flex items-start justify-between gap-5 p-6">
//           <div>
//             <p className="type-eyebrow">
//               Personal details
//             </p>

//             <h2 className="type-section-title mt-2">
//               About you
//             </h2>
//           </div>

//           <button
//             type="button"
//             onClick={openDialog}
//             className="
//               inline-flex
//               shrink-0
//               items-center
//               gap-2
//               rounded-full
//               border border-line
//               px-4 py-2
//               text-sm font-semibold
//               text-ink
//               transition
//               hover:border-accent
//               hover:text-accent
//             "
//           >
//             <Pencil
//               size={14}
//               aria-hidden
//             />

//             Edit
//           </button>
//         </div>

//         <div className="grid border-t border-line sm:grid-cols-2">
//           <Detail
//             label="Preferred name"
//             value={
//               profile.preferredName?.trim() ||
//               'Not set'
//             }
//           />

//           <Detail
//             label="Time zone"
//             value={profile.timeZone.replaceAll(
//               '_',
//               ' ',
//             )}
//           />
//         </div>
//       </section>

//       {isOpen && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           aria-labelledby="edit-profile-title"
//           className="
//             feature-fade-in
//             fixed inset-0 z-50
//             grid place-items-center
//             overflow-y-auto
//             bg-[#102c25]/65
//             p-5
//             backdrop-blur-sm
//           "
//         >
//           <div className="relative my-auto w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
//             <button
//               type="button"
//               aria-label="Close profile editor"
//               disabled={
//                 updateProfile.isPending
//               }
//               onClick={
//                 closeDialog
//               }
//               className="
//                 absolute right-5 top-5
//                 grid size-9
//                 place-items-center
//                 rounded-full
//                 text-muted
//                 transition
//                 hover:bg-surface-muted
//                 hover:text-ink
//                 disabled:opacity-50
//               "
//             >
//               <X
//                 size={18}
//                 aria-hidden
//               />
//             </button>

//             <p className="type-eyebrow">
//               Personal details
//             </p>

//             <h2
//               id="edit-profile-title"
//               className="type-section-title mt-2 pr-10"
//             >
//               Edit your details
//             </h2>

//             <p className="type-body mt-2">
//               Update how your
//               information appears
//               throughout Salif.
//             </p>

//             <form
//               className="mt-6"
//               onSubmit={
//                 form.handleSubmit(
//                   submitProfile,
//                 )
//               }
//               noValidate
//             >
//               <div className="grid gap-4 sm:grid-cols-2">
//                 <Field
//                   label="First name"
//                   error={
//                     form.formState
//                       .errors
//                       .firstName
//                       ?.message
//                   }
//                 >
//                   <input
//                     {...form.register(
//                       'firstName',
//                     )}
//                     autoComplete="given-name"
//                     className={
//                       inputClassName
//                     }
//                   />
//                 </Field>

//                 <Field
//                   label="Last name"
//                   error={
//                     form.formState
//                       .errors
//                       .lastName
//                       ?.message
//                   }
//                 >
//                   <input
//                     {...form.register(
//                       'lastName',
//                     )}
//                     autoComplete="family-name"
//                     className={
//                       inputClassName
//                     }
//                   />
//                 </Field>
//               </div>

//               <div className="mt-4">
//                 <Field
//                   label="Preferred name"
//                   optional
//                   error={
//                     form.formState
//                       .errors
//                       .preferredName
//                       ?.message
//                   }
//                 >
//                   <input
//                     {...form.register(
//                       'preferredName',
//                     )}
//                     autoComplete="nickname"
//                     placeholder="What should Salif call you?"
//                     className={
//                       inputClassName
//                     }
//                   />
//                 </Field>
//               </div>

//               <div className="mt-4">
//                 <Field
//                   label="Time zone"
//                   error={
//                     form.formState
//                       .errors
//                       .timeZone
//                       ?.message
//                   }
//                 >
//                   <select
//                     {...form.register(
//                       'timeZone',
//                     )}
//                     className={`${inputClassName} cursor-pointer`}
//                   >
//                     {timeZones.map(
//                       (
//                         timeZone,
//                       ) => (
//                         <option
//                           key={
//                             timeZone
//                           }
//                           value={
//                             timeZone
//                           }
//                         >
//                           {timeZone.replaceAll(
//                             '_',
//                             ' ',
//                           )}
//                         </option>
//                       ),
//                     )}
//                   </select>
//                 </Field>
//               </div>

//               {formError && (
//                 <p
//                   role="alert"
//                   className="mt-5 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger"
//                 >
//                   {formError}
//                 </p>
//               )}

//               <div className="mt-7 flex justify-end gap-3 border-t border-line pt-5">
//                 <button
//                   type="button"
//                   disabled={
//                     updateProfile.isPending
//                   }
//                   onClick={
//                     closeDialog
//                   }
//                   className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-ink"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={
//                     updateProfile.isPending
//                   }
//                   className="
//                     inline-flex
//                     min-w-32
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-full
//                     bg-primary
//                     px-5 py-2.5
//                     text-sm font-semibold
//                     text-white
//                     transition
//                     hover:bg-primary-hover
//                     disabled:opacity-50
//                   "
//                 >
//                   {updateProfile.isPending && (
//                     <LoaderCircle
//                       size={16}
//                       className="animate-spin"
//                       aria-hidden
//                     />
//                   )}

//                   {updateProfile.isPending
//                     ? 'Saving…'
//                     : 'Save changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// interface DetailProps {
//   readonly label: string
//   readonly value: string
// }

// function Detail({
//   label,
//   value,
// }: DetailProps) {
//   return (
//     <div className="px-6 py-5 first:border-b first:border-line sm:first:border-b-0 sm:first:border-r">
//       <p className="text-xs font-medium text-subtle">
//         {label}
//       </p>

//       <p className="mt-1 text-sm font-semibold text-ink">
//         {value}
//       </p>
//     </div>
//   )
// }

// interface FieldProps {
//   readonly label: string
//   readonly optional?: boolean
//   readonly error?: string
//   readonly children: ReactNode
// }

// function Field({
//   label,
//   optional = false,
//   error,
//   children,
// }: FieldProps) {
//   return (
//     <label className="type-label block">
//       {label}

//       {optional && (
//         <span className="ml-1 font-normal text-subtle">
//           (optional)
//         </span>
//       )}

//       {children}

//       {error && (
//         <span className="mt-1.5 block text-xs font-medium text-danger">
//           {error}
//         </span>
//       )}
//     </label>
//   )
// }