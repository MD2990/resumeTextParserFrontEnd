import {
  Badge,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Input,
  Link,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdClear } from "react-icons/md";
import { ImCloudUpload } from "react-icons/im";

export default function Home() {
  const [theFile, setTheFile] = useState([]);
  const [status, setStatus] = useState("");
  const [is_BTN_disabled, set_is_BTN_disabled] = useState(true);
  const [is_INPUT_disabled, set_is_INPUT_disabled] = useState(false);
  const [keywords, setKeyWords] = useState([]);
  const [res, setRes] = useState();
  const [errors, setErrors] = useState();

  const ref = useRef("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    set_is_BTN_disabled(true);
    set_is_INPUT_disabled(true);
    let formData = new FormData();

    for (let i = 0; i < theFile.length; i++) {
      formData.append("file", theFile[i]);

      // this should be 0 because we have only one input value
      // this will be splitted by the comma or space on server side
      formData.append("key", keywords[0]);
    }

    axios
      .post("http://localhost:3001/upload", formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          let percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setStatus(percentCompleted + "%");
        },
      })
      .then((data) => {
        if (data.data.done) {
          set_is_BTN_disabled(false);
          set_is_INPUT_disabled(false);
          setStatus(`${theFile.length} file(s) Uploaded Successfully`);
        }
        return data;
      })
      .then((data) => {
        if (data.status === 200) {
          setRes(data.data);
        }
        setErrors("Something went wrong, please try again later");
      })

      .catch((err) => {
        setErrors("Something went wrong, please try again later");
      })
      .finally(() => {
        set_is_BTN_disabled(false);
        set_is_INPUT_disabled(false);
      });
  };

  return (
    <>
      <Head>
        <title> Resume Text Parser </title>
        <meta
          name="description"
          content="A simple front end resume text parser app"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <VStack m="2%" mt="5%" spacing={[2, 6, 8, 10]}>
        <Box color={"blue.300"} fontSize={["2xl", "4xl", "6xl", "8xl"]}>
          <ImCloudUpload />
        </Box>
        <Text
          textShadow={"0 5px 10px lightblue"}
          letterSpacing={["-0.01em", "-0.05em", "0.08em", "0.1em"]}
          textAlign={"center"}
          mb={[2, 4, 6, 12]}
          fontWeight="black"
          color={"blue.400"}
          fontFamily="serif"
          fontSize={["lg", "2xl", "4xl", "5xl"]}
        >
          Upload and Filter Your Resumes
        </Text>

        <form onSubmit={handleSubmit}>
          <input
            className="choose"
            size={"lg"}
            disabled={is_INPUT_disabled}
            required
            type="file"
            multiple
            accept="application/pdf"
            name="file"
            ref={ref}
            onChange={(e) => {
              fileHandler(e);
            }}
          />
          <Input
            onChange={(e) => {
              setKeyWords([e.target.value]);
            }}
            type="text"
            name="key"
            placeholder="Your Keywords separated by comma (,) or space"
            my="5"
            size={"lg"}
            required
            w="full"
            value={keywords}
          />

          <HStack>
            <Button
              leftIcon={<AiOutlineCloudUpload />}
              colorScheme="teal"
              variant="solid"
              disabled={is_BTN_disabled || !keywords.length}
              type="submit"
            >
              Submit
            </Button>
            <Button
              colorScheme="red"
              variant="solid"
              leftIcon={<MdClear />}
              disabled={is_BTN_disabled && !keywords.length}
              onClick={cleanUp}
            >
              Clear
            </Button>
          </HStack>
        </form>

        {status && <h4>{status}</h4>}
      </VStack>
      {res?.data?.length ? (
        <Center boxShadow={"2xl"} rounded="2xl" m="4" p="4">
          <Wrap
            direction={"column"}
            justify="center"
            align={"center"}
            spacing={[1, 2, 3, 4]}
          >
            <WrapItem>
              <Text
                mb={[1, 2, 3, 4]}
                fontSize={["sm", "2xl", "3xl", "4xl"]}
                fontWeight="bold"
                color={"blue.200"}
              >
                {res.message} from total of
                <Text
                  as={"span"}
                  mx="4"
                  textDecoration={"underline"}
                  color="blue.400"
                >
                  {res.data.length}
                </Text>
                keywords
              </Text>
            </WrapItem>
            <Link href="http://localhost:3001/uploads" isExternal>
              <Button
                size={"lg"}
                w="full"
                variant="outline"
                colorScheme={"blue"}
              >
                View Accepted/Rejected Resumes
              </Button>
            </Link>

            <WrapItem>
              <Wrap
                justify={"center"}
                align="center"
                spacing={[1, 2, 3]}
                maxW="65rem"
              >
                {res.data.map((item, index) => {
                  return (
                    <WrapItem key={index}>
                      <Badge
                        colorScheme="teal"
                        fontSize={["xs", "md", "lg", "xl"]}
                        color="blue.700"
                        p="2"
                        rounded={"lg"}
                        shadow="inner"
                      >
                        {item}
                      </Badge>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </WrapItem>
          </Wrap>
        </Center>
      ) : (
        <Center>
          <Heading color={"red.300"}> {errors}</Heading>
        </Center>
      )}
    </>
  );

  function fileHandler(e) {
    setTheFile(e.target.files);
    if (e.target.files.length) {
      set_is_BTN_disabled(false);
    } else {
      setStatus("");
      set_is_BTN_disabled(true);
    }
  }

  function cleanUp() {
    ref.current.value = null;
    setTheFile([]);
    setStatus("");
    set_is_BTN_disabled(true);
    setKeyWords([]);
    setRes("");
    setErrors("");
  }
}
