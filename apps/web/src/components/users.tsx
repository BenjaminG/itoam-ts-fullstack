import { trpc } from '../utils.ts'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { queryClient } from '../utils.ts'
import { Button, Input } from '@itoam/ui'

interface EditingState {
  userId: string | null
  value: string
}

/**
 * This component is here as an example of how using tRPC and React Query
 * feel free to delete it
 */
export function UsersList() {
  const { data } = useQuery(trpc.getUsers.queryOptions())
  const [editing, setEditing] = useState<EditingState>({
    userId: null,
    value: '',
  })

  const updateEmailMutation = useMutation(
    trpc.updateEmail.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.getUsers.queryFilter())
      },
    })
  )

  const handleEditStart = (userId: string, currentEmail: string) => {
    setEditing({ userId, value: currentEmail })
  }

  const handleEditCancel = () => {
    setEditing({ userId: null, value: '' })
  }

  const handleEditSubmit = async (userId: string) => {
    try {
      await updateEmailMutation.mutateAsync({
        id: userId,
        email: editing.value,
      })
      setEditing({ userId: null, value: '' })
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        console.error(error)
      }
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent, userId: string) => {
    if (e.key === 'Enter') {
      await handleEditSubmit(userId)
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Balance
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900 uppercase"
              >
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data?.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm font-medium whitespace-nowrap text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                  {editing.userId === user.id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        await handleEditSubmit(user.id)
                      }}
                      className="flex items-center gap-2"
                    >
                      <Input
                        type="email"
                        value={editing.value}
                        onChange={(e) =>
                          setEditing((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => handleKeyDown(e, user.id)}
                        placeholder="Enter new email"
                        autoFocus
                      />
                      <Button type="submit">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </Button>
                      <Button onClick={handleEditCancel}>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </form>
                  ) : (
                    <div className="group flex items-center gap-2">
                      <span>{user.email}</span>
                      <Button
                        onClick={() => handleEditStart(user.id, user.email)}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </Button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-sm font-medium whitespace-nowrap text-gray-900">
                  {user.balance.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-700">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
